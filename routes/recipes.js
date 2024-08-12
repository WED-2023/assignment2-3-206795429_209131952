var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");
const axios = require('axios');


// router.get("/", (req, res) => res.send("im here"));

/**
 * This path is for searching a recipe
 */
router.get("/search", async (req, res, next) => {
  try {
    const recipeName = req.query.recipeName;
    const cuisine = req.query.cuisine;
    const diet = req.query.diet;
    const intolerance = req.query.intolerance;
    const number = req.query.number || 5;
    const results = await recipes_utils.searchRecipe(recipeName, cuisine, diet, intolerance, number);
    res.status(200).send(results);
  } catch (error) {
    next(error);
  }})

/**
 * This path returns a full details of a recipe by its id
 */
router.get("/recipe/:recipeId", async (req, res, next) => {
  try {
    const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId);
    res.status(200).send(recipe);
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns a specified number of random recipes
 */
router.get("/random", async (req, res, next) => {
  try {
    const number = 3 ;
    const recipes = await recipes_utils.getRandomRecipes(3);
    res.status(200).send(recipes);
  } catch (error) {
    next(error);
  }
});

// Endpoint to fetch last search results
router.get('/last-search', async (req, res, next) => {
  try {
    // Implement logic to fetch and return last search results for the logged-in user
    const results = await fetchLastSearchForUser(req.user.id); // Example function to fetch from database
    res.status(200).json({ recipes: results });
  } catch (error) {
    next(error);
  }
});




module.exports = router;
