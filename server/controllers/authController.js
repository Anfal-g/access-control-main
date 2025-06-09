import User from '../models/User.js';
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import helper from '../../../BasicNetwork-2.0-master/api-2.0/app/helper.js';

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find user and verify credentials (original flow)
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: "Wrong password" });
        }

        // 2. Only verify Fabric registration for residents (not admins)
        if (user.role === 'resident') {
            try {
                const isUserRegistered = await helper.isUserRegistered(user.residentId , 'Org1');
                if (!isUserRegistered) {
                    return res.status(403).json({
                        success: false,
                        error: "Resident not registered in blockchain system"
                    });
                }
            } catch (fabricError) {
                console.error("Fabric verification failed:", fabricError);
                return res.status(500).json({
                    success: false,
                    error: "Blockchain verification service unavailable"
                });
            }
        }else if(user.role === 'admin'){
            try {
                const isUserRegistered = await helper.isUserRegistered(user.name , 'Org2');
                if (!isUserRegistered) {
                    return res.status(403).json({
                        success: false,
                        error: "admin not registered in blockchain system"
                    });
                }
            } catch (fabricError) {
                console.error("Fabric verification failed:", fabricError);
                return res.status(500).json({
                    success: false,
                    error: "Blockchain verification service unavailable"
                });
            }
        }

        // 3. Generate token (original format)
        const token = jwt.sign(
            {
                _id: user._id, 
                role: user.role,
                // Include Fabric-related claims if needed
                ...(user.role === 'resident' && { 
                    fabricRegistered: true,
                    orgName: 'Org1' 
                })
            },
            process.env.JWT_KEY, 
            { expiresIn: "10d" }
        );

        // 4. Return response (original format with optional Fabric info)
        return res.status(200).json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                role: user.role,
                ...(user.role === 'resident' && { 
                    fabricRegistered: true,
                    orgName: 'Org1' 
                })
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

const verify = (req, res) => {
    return res.status(200).json({ success: true, user: req.user });
};

export { login, verify };