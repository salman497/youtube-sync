import { Router, Request, Response } from 'express';
import { createOAuth2Client } from '../../services/youtube';

export const authRouter = Router();

const YOUTUBE_SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtubepartner',
  'https://www.googleapis.com/auth/youtube.force-ssl'
];

authRouter.get('/youtube', (req: Request, res: Response) => {
  const oauth2Client = createOAuth2Client();
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: YOUTUBE_SCOPES,
    prompt: 'consent'
  });
  res.redirect(authUrl);
});

authRouter.get('/youtube/callback', async (req: Request, res: Response) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).send('Missing code');
  }

  try {
    const oauth2Client = createOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code as string);
    (req.session as any).tokens = tokens;
    
    // Redirect to frontend
    res.redirect(process.env.WEB_HOST || 'http://localhost:5173');
  } catch (error) {
    console.error('Error getting tokens', error);
    res.status(500).send('Error getting tokens');
  }
});

authRouter.get('/status', (req: Request, res: Response) => {
    if ((req.session as any).tokens) {
        res.json({ loggedIn: true });
    } else {
        res.json({ loggedIn: false });
    }
});

authRouter.post('/logout', (req: Request, res: Response) => {
    req.session.destroy((err: any) => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out.' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out' });
    });
}); 