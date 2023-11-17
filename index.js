const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors')
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const DatabaseUrl=process.env.DatabaseUrl

// MongoDB connection
mongoose.connect(DatabaseUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User model
const User = mongoose.model('User', {
  firstname: String,
  lastname: String,
  email: String,
  mob: String,
  image: String,
  company: String,
  active: {
    type: Boolean,
    default: false
  }
});

app.use(bodyParser.json());
app.use(cors())

// Fetch user data
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Fetch user data with search
app.get('/api/user', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search && search.trim() !== '') {
      query = {
        $or: [
          { firstname: new RegExp(search, 'i')  },
          { lastname: new RegExp(search, 'i')  }, // case-insensitive
          { email: new RegExp(search, 'i') },
          { phone: new RegExp(search, 'i') },
          { company: new RegExp(search, 'i') },
        ],
      };
    }

    const users = await User.find(query);
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


// Create user
app.post('/api/users', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/users/count',async(req,res)=>{

    try {
        const total= await User.countDocuments();
        res.json({total})
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }

})

app.get('/api/users/activeCount', async (req, res) => {
    try {
        const activeCount = await User.countDocuments({ active: true });
        res.json({ activeCount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// Delete user
app.delete('/api/users/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(deletedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Update user
app.put('/api/users/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const updatedUser = await User.findByIdAndUpdate(userId, req.body, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
