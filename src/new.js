const AuthModel = require('../models/AuthModel')
const bcrypt=require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer=require('nodemailer')
const multer=require('fastify-multer')
// const multer=require('multer')
const path=require('path')
const moment=require('moment')
											  
													 
									   
							 
									 
									   
														  
																									  
																   



console.log(path.join(__dirname, '..','public'));
const JWT_SECRET = 'afd2334fsd4qcz33sd3';

// const transporter = nodemailer.createTransport({
//     // Your email configuration
//     service: 'gmail',
//     auth: {
//         user: 'dharvish1234@gmail.com',
//         pass: 'shxyzijllqwxzsdnv'
//     }
// })
const AddCustomer = async (req,res) =>{
    try{
        const {values} = req.body
        const hashedPassword = await bcrypt.hash(values.password, 10)
        let userData = {};
        userData['email'] = values.email
        userData['phoneNumber'] = values.phoneNumber
        userData['password'] = hashedPassword
        userData['pass'] =values.password
        userData['userType'] = 3

        // console.log('incoming password : ',values.password);
        // console.log('userData : ',userData);


        const existingCustomer=await AuthModel.existingCustomer(userData)
        if(existingCustomer) {
            res.send({status:0,message:'User already existed with same email or phone number'})
        }else {
            
        
        const addUserId = await AuthModel.AddUser(userData)
        if(addUserId){
            
            let customerData = {}
            customerData['firstName'] = values.firstName
            customerData['lastName'] = values.lastName
            customerData['email'] = values.email
            customerData['phoneNumber'] = values.phoneNumber
            customerData['userId'] = addUserId
            customerData['dateRegistered'] = moment().format('DD-MM-YYYY')
            const addCustomerResult = await AuthModel.AddCustomer(customerData)
            if(addCustomerResult){
                // console.log("adduserid",addUserId);

                 // Sending congratulatory email
                //  const mailOptions = {
                //     from: 'dharvish1234@gmail.com',
                //     to: values.email,
                //     subject: 'Congratulations on your signup!',
                //     text: 'Welcome to our platform. We are excited to have you as a new customer.'
                // }

                // transporter.sendMail(mailOptions, (error, info) => {
                //     if (error) {
                //         console.log('Error sending email:', error);
                //     } else {
                //         console.log('Email sent: ' + info.response);
                //     }
                // });

                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                      user: 'dharvish1234@gmail.com',
                      pass: 'hypbbrrounimacvz'
                    }
                  });

											 

                  
                  var mailOptions = {
                    from: 'dharvish1234@gmail.com',
                    to: `${values.email}`,
                    subject: 'Welcome to Shop America Form Nigeria',
                    text: `Welcome to Shop America form Nigeria`
								  
                  };
                  
                   transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      console.log(error);
                      res.send({message:"Error",status:0})
             
                    } else {
                      console.log('Email sent: ' + info.response);
                      res.send({message:"Success",status:1})
                    }
                  }); 



                const token = jwt.sign({ id: addUserId }, JWT_SECRET, { expiresIn: '24h' });
                return res.status(200).send({ accessToken: token, user: customerData,message:'Customer added successfully',status:1 });

                // res.send({status:1,message:'Customer added successfully'})
            }else{
                res.send({status:0,message:'Failed to add customer'})
            }
        }else{
            console.log('Error adding user');
        }
    }
    } catch(error){
        console.log('Add customer error : ',error);
        res.send({status:500,message:'Server Error'})
    }
}


const loginCustomer = async (req, res) => {
    try {
        const {email,password} = req.body
       
    //   console.log('email : ',email,'password',password);
        const customer = await AuthModel.findCustomerandRetriveData(email);
            
             const customerData= await AuthModel.customerData(email)
             console.log("customer---------------",customerData);
             console.log("customer+++==",customer);

        if(customerData.account_status === 2) {
            console.log("User Account has been Disabled");
            return res.send({status:0,message:"User Account has been Disabled"})
        }
        if (!customer?.password) {
            return res.status(401).send({ message: 'Invalid email' });
        }else{
        // console.log('customer : ',customer);
      
        try {
            const passwordMatch = await bcrypt.compare(password, customer?.password);
            // console.log("Password matches:", passwordMatch);
            if (!passwordMatch) {
                return res.status(401).send({ message: 'Invalid password' });
            }else{
                // Passwords match, customer is authenticated
                // Here you can generate a token or set up a session
                // For simplicity, I'm just sending a success message
                const customerDetails =await AuthModel.customerData(email)
                if(customerDetails) {
                    // console.log("yes",customerDetails)
                    const token = jwt.sign({ id: customerDetails.dataValues.id }, JWT_SECRET, { expiresIn: '24h' });
                    return res.status(200).send({ accessToken: token, user: customerDetails ,status:1,message:"Login successful"});
                }
                    return res.status(200).send({ message: 'Login successful',status:1 });
 
            }
    
        } catch (err) {
            console.error("Error comparing passwords:", err);
        }
        }
    } catch (error) {
        console.error('Login customer error:', error);
        return res.status(500).send({ message: 'Server Error' });
    }
};




const storage=multer.diskStorage({
    destination:(req,file,cb)=> {
        cb(null,path.join(__dirname,'..','public'))
						 
    },
    filename:(req,file,cb)=> {
        cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname))
    }
})

const upload=multer({
    storage:storage
})


const updateUser = async (req, res) => {
    try {
        // The 'fieldName' parameter should match the name of the field in your form that contains the file
        upload.single('photoURL')(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                // A Multer error occurred when uploading.
                return res.status(500).send({ message: "Error uploading file" });
            } else if (err) {
                // An unknown error occurred when uploading.
                return res.status(500).send({ message: "Unknown error uploading file" });
            }

           
            const { id } = req.params;
            const { values } = req.body;
             console.log("all values",values)

             

             
                 const hashedPassword = await  bcrypt.hash(values.password, 10)

       

             let customerDataForUserTable={
                email: values.email,
                phoneNumber: values.phoneNumber,
                password:hashedPassword,
                pass:values.password,
                userId:values.userId,
             }

             


            let customerData = {
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
                phoneNumber: values.phoneNumber,
                address: values.address,
                country: values.country,
                state: values.state,
                city: values.city,
                zipCode: values.zipCode,
                about: values.about,
                

                
                // image:values.photoURL.path
            };

            // Check if a file was uploaded
            
             const filename=req.file
            if (req.file) {
                // If a file was uploaded, add its path to customerData
                customerData.image = req.file.path ;
                console.log("img",customerData.image)
                console.log("img=-=-================")
             
            }else {
                console.log("no req.file")
            }

            const existingCustomer = await AuthModel.findCustomerById(id);
            if (existingCustomer) {
                  
                const updateUser = await AuthModel.UpdateUser(customerDataForUserTable)
               
                    if(updateUser) {
                        res.send({ message: "User data updated successfully" ,status:1})
                    } else {
                        res.send({ message: "Error while updating data",status:0 });
                    }
              
                const update = await AuthModel.updateCustomerDetails(id, customerData);
                 
                if (update) {
                    res.send({ message: "User data updated successfully" ,status:1});
                } else {
                    res.send({ message: "Error while updating data",status:0 });
                }
            } else {
                return res.send({ message: "User not found",status:0 });
            }
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send({ message: "Server Error" });
    }
}


const updateProfile = async (req, res) => {
    try {
        // The 'fieldName' parameter should match the name of the field in your form that contains the file
        upload.single('photoURL')(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                // A Multer error occurred when uploading.
                return res.status(500).send({ message: "Error uploading file" });
            } else if (err) {
                // An unknown error occurred when uploading.
                return res.status(500).send({ message: "Unknown error uploading file" });
            }

           
            const { id } = req.params;
            const { values } = req.body;
             console.log("all values",values)



             let customerDataForUserTable={
                email: values.email,
                phoneNumber: values.phoneNumber, 
                pass:values.password,
                // userId:values.userId,
             }

             


            let customerData = {
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
                phoneNumber: values.phoneNumber,
                address: values.address,
                country: values.country,
                state: values.state,
                city: values.city,
                zipCode: values.zipCode,
                about: values.about,

                // image:values.photoURL.path
            };

            // Check if a file was uploaded
            
             const filename=req.file
            if (req.file) {
                // If a file was uploaded, add its path to customerData
                customerData.image = req.file.path ;
                console.log("img",customerData.image)
                console.log("img=-=-================")
			   
             
            }else {
                console.log("no req.file")
            }

            const existingCustomer = await AuthModel.findCustomerById(id);
            if (existingCustomer) {
                  
                const updateUser = await AuthModel.UpdateUser(customerDataForUserTable)
               
                    if(updateUser) {
                        res.send({ message: "User data updated successfully" ,status:1})
					  
                    } else {
                        res.send({ message: "Error while updating data",status:0 });
                    }
              
                const update = await AuthModel.updateCustomerDetails(id, customerData);
                 
                if (update) {
											 

                    res.send({ message: "User data updated successfully" ,status:1});
                } else {
                    res.send({ message: "Error while updating data",status:0 });
                }
            } else {
                return res.send({ message: "User not found",status:0 });
            }
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send({ message: "Server Error" });
    }
}


											  
			
										 
									   
												
													   

											 
										 
													  
									   
									   
				

								   
													 
												   
											 
														 
												 
												 
											 
										   
												 
											 
												
				 

											  

												
																						   
															
				
			
			
																			 
									  
				  
																						  
			   
									   
																						   
						 
								
																								  
						   
			  
																						  
				 
								
												

																							  
						   
																				   
					
					   
																		   
				
	   
						
													  
															 
		
	


const updateStatus=async (req,res) => {
    try {
        const { id } = req.params;
        const  userStatus  = req.body;

            console.log("userStatus",userStatus);
            const statusValue = userStatus.userStatus;

        let customerData = {
            account_status:statusValue
        }

        const existingCustomer = await AuthModel.findCustomerById(id);
        if (existingCustomer) {
            const update = await AuthModel.updateCustomerDetails(id, customerData);

            if (update) {
                res.send({ message: "User Status updated successfully" ,status:1});
            } else {
                res.send({ message: "Error while updating data",status:0 });
            }
        } else {
            return res.send({ message: "User not found",status:0 });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send({ message: "Server Error" });
    }
}


const findAllCustomer=async(req,res)=> {

    const  data= await AuthModel.findCustomers()
    if(data) {
        res.send({data,status:1})
    }else {
        res.send({status:0,message:"cannot get users"})
    }
}

const findCustomerById = async (req,res)=>{
    try {
      const {id}=req.params

    const result=await AuthModel.findCustomerById(id)
    // console.log("====================++",result)
  
    if(result) {
      res.send({status:1,result:result})
    }else {
      res.send({status:0})

    }
    } catch (error) {
      console.error('Error findCustomerById:', error);
      res.status(500).send({ message: "Server Error" });
    }
}


// staff

const addStaff = async (req,res) =>{
    try{
        const {values} = req.body
        const hashedPassword = await bcrypt.hash(values.password, 10)
        let userData = {};
        userData['email'] = values.email
        userData['phoneNumber'] = values.phoneNumber
        userData['password'] = hashedPassword
        userData['pass'] =values.password
        userData['userType'] = 1

        const existingCustomer=await AuthModel.existingStaff(userData)
        if(existingCustomer) {
            res.send({status:500,message:'User already existed with the same email id or Phone number'})
        }else {
            
        
        const addUserId = await AuthModel.addUserStaff(userData)
        if(addUserId){
            
            let customerData = {}
            customerData['firstName'] = values.firstName
            customerData['lastName'] = values.lastName
            customerData['email'] = values.email
            customerData['phoneNumber'] = values.phoneNumber
            customerData['userId'] = addUserId
            customerData['dateRegistered'] = moment().format('DD-MM-YYYY')
            const addCustomerResult = await AuthModel.AddStaff(customerData)
            if(addCustomerResult){
                // console.log("adduserid",addUserId);

                 // Sending congratulatory email
                 const mailOptions = {
                    from: 'dharvish1234@gmail.com',
                    to: values.email,
                    subject: 'Congratulations on your signup!',
                    text: 'Welcome to our platform. We are excited to have you as a new Staff.'
                }

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log('Error sending email:', error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });

                const token = jwt.sign({ id: addUserId }, JWT_SECRET, { expiresIn: '24h' });
                return res.status(200).send({ accessToken: token, user: customerData,message:'Staff added successfully' });

               
            }else{
                res.send({status:0,message:'Failed to add Staff'})
            }
        }else{
            console.log('Error adding user');
        }
    }
    } catch(error){
        console.log('Add customer error : ',error);
        res.send({status:500,message:'Server Error'})
    }
}

const findAllStaff=async(req,res)=> {

 try {
    const  data= await AuthModel.findStaff()
    if(data) {
        res.send({result:data,status:1})
    }else {
        res.send({status:0,message:"cannot get staffs"})
    }
 } catch (error) {
    console.error('Error findAllStaff:', error);
    res.status(500).send({ message: "Server Error" });
 }
}

const findStaffById = async (req,res)=>{
      try {
        const {id}=req.params

      const result=await AuthModel.findStaffById(id)
      if(result) {
        res.send({status:1,result:result})
      }else {
        res.send({status:0})

      }
      } catch (error) {
        console.error('Error findCustomerById:', error);
        res.status(500).send({ message: "Server Error" });
      }
}


const updateStaff = async (req, res) => {
    try {
        // The 'fieldName' parameter should match the name of the field in your form that contains the file
        upload.single('photoURL')(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                // A Multer error occurred when uploading.
                return res.status(500).send({ message: "Error uploading file" });
            } else if (err) {
                // An unknown error occurred when uploading.
                return res.status(500).send({ message: "Unknown error uploading file" });
            }

           
            const { id } = req.params;
            const { values } = req.body;
             console.log("all values",values)

             const hashedPassword = await bcrypt.hash(values.password, 10)

             let staffDataForUserTable={
                email: values.email,
                phoneNumber: values.phoneNumber,
                password:hashedPassword,
                pass:values.password,
                userId:values.userId,
             }



            let customerData = {
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
                phoneNumber: values.phoneNumber,
                address: values.address,
                country: values.country,
                state: values.state,
                city: values.city,
                zipCode: values.zipCode,
                about: values.about,
                // image:values.photoURL.path
            };

            // Check if a file was uploaded
            
            if (req.file) {
                const filename=req.file
                // If a file was uploaded, add its path to customerData
                customerData.image = req.file.path ;
                console.log("img",customerData.image)
                console.log("img=-=-================")
             
            }else {
                console.log("no req.file")
            }

            const existingCustomer = await AuthModel.findStaffById(id);
            if (existingCustomer) {

                const updateStaff = await AuthModel.UpdateUserStaff(staffDataForUserTable)
               
                if(updateStaff) {
                    res.send({ message: "Staff data updated successfully" ,status:1})
                } else {
                    res.send({ message: "Error while updating data",status:0 });
                }
          



                const update = await AuthModel.updateStaffDetails(id, customerData);

                if (update) {
                    res.send({ message: "Staff data updated successfully" ,status:1});
                } else {
                    res.send({ message: "Error while updating data",status:0 });
                }
            } else {
                return res.send({ message: "Staff not found",status:0 });
            }
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send({ message: "Server Error" });
    }
}

const updateStatusStaff = async(req,res)=>{
    try {
        const { id } = req.params;
        const  userStatus  = req.body;

            console.log("StaffStatus",userStatus);
            const statusValue = userStatus.userStatus;

        let customerData = {
            account_status:statusValue
        }

        const existingStaff = await AuthModel.findStaffById(id);
        if (existingStaff) {
            const update = await AuthModel.updateStaffDetails(id, customerData);

            if (update) {
                res.send({ message: "Staff Status updated successfully" ,status:1});
            } else {
                res.send({ message: "Error while updating data",status:0 });
            }
        } else {
            return res.send({ message: "User not found",status:0 });
        }
    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).send({ message: "Server Error" });
    }
}

const loginStaff = async (req, res) => {
    try {
        const {email,password} = req.body
       
      console.log('email : ',email,'password',password);

    //  findexisting stafff
    let staffData = {};
    staffData['email'] = email
    staffData['password'] = password

   

        const customer = await AuthModel.findStaffRetriveData(email);

        const dataStaff= await AuthModel.staffData(email)
        console.log("customer---------------",dataStaff);
       

   if(dataStaff.account_status === 2) {
       console.log("User Account has been Disabled");
       return res.send({status:0,message:"User Account has been Disabled"})
   }else {

  

        if (!customer) {
            return res.status(401).send({ message: 'Invalid email' });
        }else{
        // console.log('customer : ',customer);
      
        try {
            
            const passwordMatch = await bcrypt.compare(password, customer?.password);
            // console.log("Password matches:", passwordMatch);
            if (!passwordMatch) {
                return res.status(401).send({ message: 'Invalid password' });
            }else{
                // Passwords match, customer is authenticated
                // Here you can generate a token or set up a session
                // For simplicity, I'm just sending a success message
                const staffDetails =await AuthModel.staffData(email)
                if(staffDetails) {
                    // console.log("yes",staffDetails)
                    const token = jwt.sign({ id: staffDetails.dataValues.id }, JWT_SECRET, { expiresIn: '24h' });
                    return res.status(200).send({ accessToken: token, user: staffDetails });
                }
                    return res.status(200).send({ message: 'Login successful' ,status:1});
 
            }
    
        } catch (err) {
            console.error("Error comparing passwords:", err);
        }
        }
    }
    } catch (error) {
        console.error('Login Staff error:', error);
        return res.status(500).send({ message: 'Server Error' });
    }
};

let OTP=null

const generateOTP =async (req,res)=> {

   try {

    const {email}=req.body

    OTP = Math.floor(100000 + Math.random() * 900000);

 console.log("email==========",email);
   var transporter = nodemailer.createTransport({
       service: 'gmail',
       auth: {
         user: 'dharvish1234@gmail.com',
         pass: 'hypbbrrounimacvz'
       }
     });
     
     var mailOptions = {
       from: 'dharvish1234@gmail.com',
       to: `${email}`,
       subject: 'Sending Email using Node.js',
       text: `Your OTP is ${OTP}`
					  
											
     };
     
      transporter.sendMail(mailOptions, function(error, info){
       if (error) {
         console.log(error);
         res.send({message:"Error",status:0})

       } else {
         console.log('Email sent: ' + info.response);
         res.send({message:"Success",status:1,otp:OTP})
       }
     }); 
    
   } catch (error) {
      console.log(error)
   }

}

const  resetPassword=async(req,res)=> {
   try {

    const {email,values} =req.body
    console.log("email-------------",email)

    const hashedPassword = await bcrypt.hash(values.password, 10)

    let userData={
       password:hashedPassword,
       pass:values.password,
     
    }

    const user = await AuthModel.findUserByEmail(email,userData);

    console.log(user,"+++");
    if(user) {
    console.log("success")
         return res.send({message:"success",status:1})
    }else {
        console.log("error");
        return res.send({message:"error",status:0})
    }
    
   } catch (error) {
    console.log(error ,"error in resetPassword")
   }


}

const findUserByEmail=async(req,res)=> {
    const {email,phoneNumber}= req.body
    
    const users=await AuthModel.findCustomerByEmail(email,phoneNumber)

    if(users){
        res.send({message:"user already existed",status:0})
    }else 
    res.send({message:"user not existed",status:1})

}

module.exports={AddCustomer,loginCustomer,updateUser,findAllCustomer,findCustomerById,updateStatus,
                addStaff,findAllStaff,findStaffById,updateStaff,loginStaff,updateStatusStaff,
                generateOTP,resetPassword,resetPassword,findUserByEmail,updateProfile}