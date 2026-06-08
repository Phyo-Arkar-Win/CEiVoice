import rateLimit from "express-rate-limit";

export const globalRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100,
    message: { message: "Too many requests. Try again later." }
})

export const loginRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { message: "Too many login attempts. Try again later." }
})
