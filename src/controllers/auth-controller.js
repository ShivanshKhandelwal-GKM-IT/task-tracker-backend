import * as authService from "../services/auth-service.js";

export async function register(req, res) {
  try {
    const { email, password, name } = req.body;
    
    
    const data = await authService.registerUser(email, password, name);
    
    
    res.status(201).json(data);
  } catch (error) {
    
    if (error.message === "Email already exists") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    
    
    const data = await authService.loginUser(email, password);
    
    
    res.json(data);
  } catch (error) {
    
    if (error.message === "Invalid credentials") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
}
