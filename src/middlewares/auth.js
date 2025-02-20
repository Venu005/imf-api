const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) throw new Error("Authentication required");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) throw new Error("Invalid token");
    next();
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};
