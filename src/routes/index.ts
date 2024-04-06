import userRoutes from './user.routes';
import { Router } from 'express';

const router = Router();

router.use('/users', userRoutes);




export default router;






