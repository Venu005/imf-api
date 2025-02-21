const router = require("express").Router();
const {
  getGadgets,
  createGadget,
  updateGadget,
  deleteGadget,
  selfDestructGadget,
} = require("../controllers/gadgets.controller");
const authMiddleware = require("../middlewares/auth");

router.use(authMiddleware);

router.get("/", getGadgets);

// POST new gadget
router.post("/", createGadget);

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

router.patch("/:id", updateGadget);

router.delete("/:id", deleteGadget);

router.post("/:id/self-destruct", selfDestructGadget);

module.exports = router;
