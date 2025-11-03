import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { db } from '../db/client.js';
import { users } from '../schema/schema.js';
import { eq } from 'drizzle-orm';
import logger from '../utils/logger.js';
import { sendWelcomeEmail } from './email.js';
import crypto from 'crypto';


const client = new OAuth2Client(process.env.OAUTH_CLIENT_ID);

export const googleLogin = async (req, res) => {
  const { credential } = req.body;

  try {
    if (!credential) {
      return res.status(400).json({ error: 'No Google credential provided' });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.OAUTH_CLIENT_ID,
    });

    const secretUser = crypto.randomBytes(32).toString('hex');// Generate a new secret_user for this session

    const payload = ticket.getPayload();
    console.log('Google Payload:', payload);


    const { email, name, picture } = payload;

    let existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

    let user;
    console.log("Creating a new one");


    if (!existingUser.length) {
      const tempUser = await db
        .insert(users)
        .values({
          name,
          email,
          password: '',
          phone: '',
          address: '',
          university: '',
          role: 'student',
          refresh_token: '', // Temporary
          is_verified: true, // Automatically verified for Google users
          secret_user: secretUser,
          verification_code: null,
          is_logged_in: true, // Automatically logged in for Google users 
        })
        .returning();

      user = tempUser[0];
      sendWelcomeEmail(user.email, user.name);
    } else {
      console.log("User already exists, updating login status");

      user = existingUser[0];
      await db
        .update(users)
        .set({
          secret_user: secretUser,
          refresh_token: '',
          is_logged_in: true, // Update login status
        })
        .where(eq(users.id, user.id));
    }

    // Generate new tokens
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        secret_user: secretUser, // Include secret_user in the token
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
      {
        id: user.id,
        secret_user: secretUser, // Include secret_user in the refresh token
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );

    // Store refresh token in DB
    await db
      .update(users)
      .set({ refresh_token: refreshToken })
      .where(eq(users.id, user.id));

    // Set tokens in cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    logger.info(`User logged in via Google: ${email} with role: ${user.role}`);
    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.error('Google Login Error:', err);
    res.status(500).json({ error: 'Google login failed' });
  }
};

