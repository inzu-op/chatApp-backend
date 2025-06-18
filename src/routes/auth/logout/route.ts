import { Request, Response } from "express";

export const logout = (req: Request, res: Response) => {
  // Clear the cookie by setting it to an expired value
  res.cookie("auth-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0), // Expire immediately
    maxAge: 0,
  });

  // Send response
  return res.status(200).json({ message: "Logged out successfully" });
};
