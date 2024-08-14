const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";



/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */


async function getRecipeInformation(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    });
}

async function getRecipeDetails(recipeId) {
    const apiKey = process.env.spooncular_apiKey;
    const url = `https://api.spoonacular.com/recipes/${recipeId}/information?includeNutrition=false&apiKey=${apiKey}`;
    
    try {
        const response = await axios.get(url);
        let { 
          id, 
          title, 
          readyInMinutes, 
          image, 
          aggregateLikes, 
          vegan, 
          vegetarian, 
          glutenFree, 
          extendedIngredients,
          analyzedInstructions,
          instructions,
          servings
        } = response.data;
    
        return {
          id: id,
          title: title,
          readyInMinutes: readyInMinutes,
          image: image,
          popularity: aggregateLikes,
          vegan: vegan,
          vegetarian: vegetarian,
          glutenFree: glutenFree,
          extendedIngredients: extendedIngredients,
          analyzedInstructions: analyzedInstructions,
          instructions: instructions,
          servings: servings
        };
    } catch (error) {
      throw error;
    }
  }

async function searchRecipe(recipeName, cuisine, diet, intolerance, number, username) {
    // Convert arrays to comma-separated strings as Spoonacular API expects
    const formattedCuisine = Array.isArray(cuisine) ? cuisine.join(',') : cuisine;
    const formattedDiet = Array.isArray(diet) ? diet.join(',') : diet;
    const formattedIntolerance = Array.isArray(intolerance) ? intolerance.join(',') : intolerance;

    // Make API call
    const response = await axios.get(`${api_domain}/complexSearch`, {
        params: {
            query: recipeName,
            cuisine: formattedCuisine,
            diet: formattedDiet,
            intolerances: formattedIntolerance,
            number: number,
            apiKey: process.env.spooncular_apiKey
        }
    });

    // Fetch detailed information for the search results
    return getRecipesPreview(response.data.results.map((element) => element.id), username);
}

async function getRandomRecipes(number = 3) {
    const response = await axios.get(`${api_domain}/random`, {
        params: {
            number: number,
            apiKey: process.env.spooncular_apiKey
        }
    });
    return response.data.recipes.map(recipe => ({
        id: recipe.id,
        title: recipe.title,
        readyInMinutes: recipe.readyInMinutes,
        image: recipe.image,
        popularity: recipe.aggregateLikes,
        vegan: recipe.vegan,
        vegetarian: recipe.vegetarian,
        glutenFree: recipe.glutenFree
    }));
}

async function getRecipesPreview(recipeIds, username) {
    try {
        const recipesPromises = recipeIds.map(async (recipeId) => {
            return await getRecipeDetails(recipeId);
        });

        const recipes = await Promise.all(recipesPromises);

        return recipes;
    } catch (error) {
        throw error; // Handle or log the error as needed
    }
}

exports.getRecipeDetails = getRecipeDetails;
exports.getRandomRecipes = getRandomRecipes;
exports.getRecipesPreview = getRecipesPreview;
exports.searchRecipe = searchRecipe;


