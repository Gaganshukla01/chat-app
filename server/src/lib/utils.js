import jwt from "jsonwebtoken";

export const genrateToken = (userId, res) => {
  const sKey = process.env.JWT_SECRET;
  const token = jwt.sign({ userId }, sKey, {
    expiresIn: "7d",
  });

  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
  });

  return token;
};
