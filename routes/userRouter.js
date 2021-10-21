const route = require("express").Router();
const { vaccinatedusers, qrtimes, users } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const qr = require("qrcode");
const { validateToken } = require("../middlewares/validation");

route.post("/register", async (req, res) => {
  const { email, username, password } = req.body;

  try {
    const user = await users.findOne({
      where: {
        email: email,
      },
    });

    if (user) {
      return res.json({ message: "User already existed" });
    } else {
      bcrypt
        .hash(password, 10)
        .then(async (hash) => {
          await users.create({
            username: username,
            email: email,
            password: hash,
          });
          return res.json({ message: "Successfully created" });
        })
        .catch((err) => res.json({ message: err }));
    }
  } catch (err) {
    return res.json({ error: err });
  }
});

route.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await users.findOne({
      where: {
        email: email,
      },
    });

    if (!user) res.json({ message: "User not found" });
    else {
      bcrypt.compare(password, user.password).then((match) => {
        if (!match) res.json({ message: "User not found" });

        const accessToken = jwt.sign(
          {
            id: user.id,
            username: user.username,
            email: user.email,
          },
          "secretCode"
          // {
          //   expiresIn: 3 * 24 * 60 * 60, // 3 days
          // }
        );
        return res.json({ accessToken, user: {
          id: user.id,
          username: user.username,
          email: user.email
        } });
      });
    }
  } catch (err) {
    return res.json({ error: err });
  }
});

route.get("/", validateToken, async (req, res) => {
  try {
    const data = await qrtimes.findAll({
      include: [vaccinatedusers],
    });
    return res.json({ message: "success", data: data });
  } catch (err) {
    console.log("err", err);
    return res.json({ message: "server error" });
  }
});

route.put("/qrcount/:id", async (req, res) => {
  // user id
  const { id } = req.params;
  const { previous_count } = req.body;

  try {
    const user = await qrtimes.update(
      {
        times: previous_count + 1,
      },
      {
        where: {
          user_id: id,
        },
      }
    );
    return res.json({ message: "success" });
  } catch (err) {
    console.log("err", err);
    return res.json({ message: "server error" });
  }
});

route.get("/count_users", validateToken, async (req, res) => {
  try {
    const totalScannedCount = await qrtimes.findAll();

    const calcuatedScannedCount = totalScannedCount.reduce((total, current) => {
      return total + current.times;
    }, 0);

    const totalVaccinated = await vaccinatedusers.count();

    const fristVaccinatedCount = await vaccinatedusers.count({
      where: {
        vaccineFirstDate: {
          [Op.not]: null,
        },
        vaccineSecondDate: null,
      },
    });
    const secondVaccinatedCount = await vaccinatedusers.count({
      where: {
        vaccineFirstDate: {
          [Op.not]: null,
        },
        vaccineSecondDate: {
          [Op.not]: null,
        },
      },
    });

    return res.json({
      totalVaccinated,
      calcuatedScannedCount,
      fristVaccinatedCount,
      secondVaccinatedCount,
    });
  } catch (err) {
    console.log("err", err);
    return res.json({ message: "server error" });
  }
});

route.get("/first_vaccined", validateToken, async (req, res) => {
  try {
    const data = await vaccinatedusers.findAll({
      where: {
        vaccineFirstDate: {
          [Op.not]: null,
        },
        vaccineSecondDate: null,
      },
    });
    return res.json({ message: "success", data });
  } catch (err) {
    console.log("err", err);
    return res.json({ message: "server error" });
  }
});

route.get("/second_vaccinated", validateToken, async (req, res) => {
  try {
    const data = await vaccinatedusers.findAll({
      where: {
        vaccineFirstDate: {
          [Op.not]: null,
        },
        vaccineSecondDate: {
          [Op.not]: null,
        },
      },
    });
    return res.json({ message: "success", data });
  } catch (err) {
    console.log("err", err);
    return res.json({ message: "server error" });
  }
});

route.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const data = await qrtimes.findOne({
      where: {
        id: id,
      },
      include: [vaccinatedusers],
    });
    return res.json({ message: "success", data: data });
  } catch (err) {
    console.log("err", err);
    return res.json({ message: "server error" });
  }
});

route.post("/", validateToken, async (req, res) => {
  const {
    nrc,
    dob,
    gender,
    address,
    vaccineFirstDate,
    vaccineSecondDate,
    phone,
    note,
    profile,
  } = req.body;
  console.log("nrc", req.body)
  let username, weburl;
  if (req.body.username) {
    username = req.body.username;
  }
  if (req.body.weburl) {
    weburl = req.body.weburl;
  }
  try {
    const userData = {
      username: username,
      weburl: weburl,
      nrc: nrc,
      dob: dob,
      gender: gender,
      address: address,
      vaccineFirstDate: new Date(),
      phone: phone,
      note: note,
      profile: "PORFILLLLLE",
    };
    console.log("user id", req.user.id)
    try {
      const user = await vaccinatedusers.create({ ...userData });
      console.log("user", user)
      const ipaddress = "192.168.100.3"; //192.168.100.149
      const src = await qr.toDataURL(
        `${ipaddress}:3000/users/${user.id}/scaned`
      );
      console.log("srccccccccc", src);
      const updateQrCode = await vaccinatedusers.update(
        {
          qrcode: src,
        },
        {
          where: {
            id: user.id,
          },
        }
      );
      const qrcodeTimes = await qrtimes.create({
        times: 0,
        user_id: user.id,
      });
      return res.json({ message: "success", data: user, qrcodeTimes });
    } catch (err) {
      console.error(err);
      return res.json({ message: "Something wrong with generating qrcode" });
    }
  } catch (err) {
    console.log("err", err);
    return res.json({ message: "server error" });
  }
});

route.put("/:id", validateToken, async (req, res) => {
  const { id, data } = req.body;

  try {
    const user = await vaccinatedusers.update(
      {
        ...data,
      },
      {
        where: {
          id: id,
        },
      }
    );
    return res.json({ message: "success", data: user });
  } catch (err) {
    console.log("err", err);
    return res.json({ message: "server error" });
  }
});

module.exports = route;
