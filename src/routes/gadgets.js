const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");
const prisma = new PrismaClient();
const authMiddleware = require("../middlewares/auth");

router.use(authMiddleware);

router.get("/", async (req, res) => {
  const { status } = req.query;
  const gadgets = await prisma.gadget.findMany({
    where: status ? { status } : {},
  });

  const gadgetsWithProbability = gadgets.map((gadget) => ({
    ...gadget,
    missionSuccessProbability: Math.floor(Math.random() * 100),
  }));

  res.json(gadgetsWithProbability);
});

router.get("/", async (req, res) => {
  const { status } = req.query;
  const validStatuses = [
    "Available",
    "Deployed",
    "Destroyed",
    "Decommissioned",
  ];

  // Validate status if provided
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({
      error:
        "Invalid status. Valid values: Available, Deployed, Destroyed, Decommissioned",
    });
  }

  try {
    const gadgets = await prisma.gadget.findMany({
      where: status ? { status } : {},
    });

    const gadgetsWithProbability = gadgets.map((gadget) => ({
      ...gadget,
      missionSuccessProbability: Math.floor(Math.random() * 100),
    }));

    res.json(gadgetsWithProbability);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch gadgets" });
  }
});

// POST new gadget
router.post("/", async (req, res) => {
  const { name, status } = req.body;
  const validStatuses = [
    "Available",
    "Deployed",
    "Destroyed",
    "Decommissioned",
  ];

  // Validate status
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({
      error:
        "Invalid status. Valid values: Available, Deployed, Destroyed, Decommissioned",
    });
  }

  const generateCodename = () =>
    `The ${faker.color.human()} ${faker.animal.type()}`;

  let codename;
  do {
    codename = generateCodename();
  } while (await prisma.gadget.findUnique({ where: { codename } }));

  const gadget = await prisma.gadget.create({
    data: {
      name,
      codename,
      status: status || "Available", // Default to Available if not provided
    },
  });

  res.status(201).json(gadget);
});
// Add before PATCH and DELETE routes
router.use("/:id", async (req, res, next) => {
  const gadget = await prisma.gadget.findUnique({
    where: { id: req.params.id },
  });

  if (gadget?.status === "Decommissioned") {
    return res.status(403).json({
      error: "Decommissioned gadgets cannot be modified",
    });
  }

  next();
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, status } = req.body;
  const validStatuses = [
    "Available",
    "Deployed",
    "Destroyed",
    "Decommissioned",
  ];

  // Validate status if provided
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({
      error:
        "Invalid status. Valid values: Available, Deployed, Destroyed, Decommissioned",
    });
  }

  try {
    const updateData = {};
    if (name) updateData.name = name;
    if (status) updateData.status = status;

    const gadget = await prisma.gadget.update({
      where: { id },
      data: updateData,
    });
    res.json(gadget);
  } catch (error) {
    res.status(404).json({ error: "Gadget not found" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const gadget = await prisma.gadget.update({
      where: { id },
      data: {
        status: "Decommissioned",
        decommissionedAt: new Date(),
      },
    });
    res.json(gadget);
  } catch (error) {
    res.status(404).json({ error: "Gadget not found" });
  }
});

router.post("/:id/self-destruct", async (req, res) => {
  const { id } = req.params;
  const confirmationCode = Math.floor(100000 + Math.random() * 900000);

  try {
    const gadget = await prisma.gadget.update({
      where: { id },
      data: { status: "Destroyed" },
    });

    res.json({
      message: "Self-destruct sequence initiated",
      confirmationCode,
      gadget,
    });
  } catch (error) {
    res.status(404).json({ error: "Gadget not found" });
  }
});

module.exports = router;
