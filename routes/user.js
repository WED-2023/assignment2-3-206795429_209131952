var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  if (req.session && req.session.username) {
    DButils.execQuery("SELECT username FROM users").then((users) => {
      if (users.find((x) => x.username === req.session.username)) {
        req.username = req.session.username;
        next();
      }
    }).catch(err => next(err));
  } else {
    res.sendStatus(401);
  }
});


/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.post('/users/favorites', async (req,res,next) => {
  try{
    const username = req.session.username;
    const recipe_id = req.body.recipeId;
    await user_utils.markAsFavorite(username,recipe_id);
    res.status(200).send("The Recipe successfully saved as favorite");
    } catch(error){
    next(error);
  }
})

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get('/users/favorites', async (req,res,next) => {
  try{
    const username = req.session.username;
    let favorite_recipes = {};
    const recipes_id = await user_utils.getFavoriteRecipes(username);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreview(recipes_id_array);
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
});

/**
 * This path returns the family recipes that were created by the logged-in user
 */
router.get('/users/family_recipes', async (req,res,next) => {
  try{
    const username = req.session.username;
    let family_recipes = {};
    const recipes_id = await user_utils.getFamilyRecipes(username);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreview(recipes_id_array);
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
});

/**
 * This path gets body with family_recipe and save this recipe in the list of the logged-in user
 */
router.post('/users/family_recipes', async (req,res,next) => {
  try{
    const username = req.session.username;
    const recipe_id = req.body.recipeId;
    const recipe_name = req.body.recipe_name;
    await user_utils.addFamilyRecipe(username,recipe_id, recipe_name);
    res.status(200).send("The Recipe successfully saved as favorite");
    } catch(error){
    next(error);
  }
})

/**
 * This path gets body with frecipe and save this recipe in the list of the logged-in user
 */
router.post('/users/my_recipes', async (req,res,next) => {
  try{
    const username = req.session.username;
    const recipe_id = req.body.recipeId;
    const title = req.body.title;
    const image = req.body.image;
    const readyInMinutes = req.body.readyInMinutes;
    const aggregateLikes = req.body.aggregateLikes;
    const vegetarian = req.body.vegetarian;
    const vegan = req.body.vegan;
    const glutenFree = req.body.glutenFree;
    const summary = req.body.summary;
    const instructions = req.body.instructions;


    await user_utils.addMyRecipe(username,recipe_id, title, image, readyInMinutes, aggregateLikes, vegetarian, vegan, glutenFree, summary, instructions);
    res.status(200).send("The Recipe successfully saved as favorite");
    } catch(error){
    next(error);
  }
});


module.exports = router;
