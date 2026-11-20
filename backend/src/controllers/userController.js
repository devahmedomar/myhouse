import User from '../models/User.js';

// Only the two seeded users are ever exposed.
export async function listUsers(_req, res) {
  const users = await User.find().select('_id name').sort({ name: 1 }).lean();
  return res.json(users);
}
