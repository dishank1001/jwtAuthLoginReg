const express = require('express');
const config = require('config');
const request = require('request');
const router = express.Router();
const {check, validationResult} = require('express-validator');

const auth = require('../../config/authToken');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { get } = require('config');


// @route GET api/profile/me
// @desc Test route
// @access Public 
router.get('/me', auth, 
    async (req, res) => {
        try {
            const profile = await Profile.findOne({user: req.user.id}).populate('user', ['name', 'avatar']);
            if(!profile){
                res.status(400).json({msg:'There is no profile for this user'})
            }
            res.json(profile);
        } catch (err) {
            res.status(500).send('Server Error')
        }
});

// @route Post api/profile/
// @desc Test route
// @access Public 
router.post('/',
auth,
check('status', 'Status is required').not().isEmpty(),
check('skills', 'Skills is required').not().isEmpty(), 
async (req, res) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    
    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        twitter,
        instagram,
        linkedin,
        facebook
      } = req.body;

    //   console.log(req.body);
      const profileFields = {}; 
      profileFields.user = req.user.id; 
      if(company) profileFields.company = company;
      if(status) profileFields.status = status;
      if(website) profileFields.website = website;
      if(location) profileFields.location = location;
      if(bio) profileFields.bio = bio;
      if(githubusername) profileFields.githubusername = githubusername;
      if(skills) {
          profileFields.skills = skills.split(',').map(skill => skill.trim());  
        };
      profileFields.social = {};
      if(youtube) profileFields.social.youtube = youtube;
      if(twitter) profileFields.social.twitter = twitter;
      if(instagram) profileFields.social.instagram = instagram;
      if(linkedin) profileFields.social.linkedin = linkedin;
      if(facebook) profileFields.social.facebook = facebook;

    //   console.log(profileFields);

      try {
          let profile = await Profile.findOne({user:req.user.id});

        //   console.log(profile);

          if(profile){
            profile = await Profile.findOneAndUpdate({user: req.user.id}, {$set: profileFields}, {new: true});
            
            return res.json(profile);
          }
          profile = new Profile(profileFields);

        //   console.log(profile);

          await profile.save();

          return res.json(profile);
      } catch (err) {
          console.error(err.message);
          res.status(500).send('Server Error');
      }
});

// @route GET api/profile/
// @desc Test route
// @access Public

router.get('/',
    async (req,res) => {
        try {
            let profiles = await Profile.find().populate('user',['name','avatar']);
            res.json(profiles);
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server Error');
        }
})

// @route GET api/profile/user/:user_id
// @desc Test route
// @access Public

router.get('/user/:user_id',
    async (req,res) => {
        try {
            let profile = await Profile.findOne({user: req.params.user_id}).populate('user',['name','avatar']);

            if(!profile){
                res.status(400).json({msg: 'There is no profile for this user'})
            }
            res.json(profile);
            
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server Error');
        }
});

// @route PUT api/profile/experience
// @desc Test route
// @access Private
router.put('/experience', 
    auth, 
    check('title', 'Title is required').notEmpty(),
    check('company', 'company is required').notEmpty(),
    async (req, res) => {
        let errors = validationResult(req);

        if(!errors.isEmpty()){
            res.status(400).json({errors: errors.array()});
        }
        
        const {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        } = req.body;

        const newExp = {
            title: title,
            company: company,
            location: location,
            from: from,
            to: to,
            current: current,
            description: description
        }

        let profile = await Profile.findOne({user: req.user.id});

        profile.experience.unshift(req.body);

        await profile.save();

        res.json(profile);
    }
)

// @route DELETE api/profile/
// @desc Test route
// @access Public
router.delete('/', auth, 
    async (req,res) => {
        try {
            await Profile.findOneAndRemove({user: req.user.id});
            await User.findOneAndRemove({_id: req.user.id});
            res.json({msg:'User Deleted'});
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server Error');
        }
})

// @route PUT api/profile/education
// @desc Test route
// @access Private
router.put('/education', 
    auth, 
    check('school', 'School is required').notEmpty(),
    check('degree', 'Degree is required').notEmpty(),
    check('fieldofstudy', 'Field of study is required').notEmpty(),
    async (req, res) => {
        let errors = validationResult(req);

        if(!errors.isEmpty()){
            res.status(400).json({errors: errors.array()});
        }
        
        const {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        } = req.body;

        const newExp = {
            school: school,
            degree: degree,
            fieldofstudy: fieldofstudy,
            from: from,
            to: to,
            current: current,
            description: description
        }

        let profile = await Profile.findOne({user: req.user.id});

        profile.education.unshift(req.body);

        await profile.save();

        res.json(profile);
    }
)

// @route Get api/profile/github/:username
// @desc Test route
// @access Public
router.get('/github/:username', (req, res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubClientSecret')}`,
            method: 'GET',
            headers: {'user-agent': 'node.js'} 
        };
        request(options,(err, response, body) => {
            if(err) console.error(err);

            if(response.statusCode !== 200){
                return res.status(404).json({msg: 'No github Repository'});
            }

            return res.json(JSON.parse(body));

        })
    } catch (err) {
        res.status(500).send('Server Error');
    }
})

// @route DELETE api/profile/experience/:edu_id
// @desc Test route
// @access Public
router.delete('/experience/:edu_id', auth, 
    async (req,res) => {
        try {
            let expProfile = await Profile.findOne({user: req.user.id});
            let index = expProfile.experience.map(item => item.id).indexOf(req.params.edu_id);
            expProfile.experience.splice(index,1);
            expProfile.save()
            res.json({msg:'User Deleted'});
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server Error');
        }
})

// @route DELETE api/profile/education/:edu_id
// @desc Test route
// @access Public
router.delete('/education/:edu_id', auth, 
    async (req,res) => {
        try {
            let edProfile = await Profile.findOne({user: req.user.id});
            let index = edProfile.education.map(item => item.id).indexOf(req.params.edu_id);
            edProfile.education.splice(index,1);
            edProfile.save()
            res.json({msg:'User Deleted'});
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server Error');
        }
})

module.exports = router;