class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        // 1) Simple Filtering
        const queryObj = {...this.queryString}; // ... is the spread operator which will create a new object from the req.query object
        const excludedFields = ["page", "sort", "limit", "fields"];
        excludedFields.forEach(el => delete queryObj[el]); // this will delete all the fields from the queryObj object which are present in the excludedFields array.

        // 2) Advanced Filtering

        let queryStr = JSON.stringify(queryObj); // this will convert the queryObj object to JSON string
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`); // this will replace all the gte, gt, lte, lt with $gte, $gt, $lte, $lt

        this.query = this.query.find(JSON.parse(queryStr)); // this will return all the tours which matches the JSON.parse(queryStr) object

        // console.log(JSON.parse(queryStr)); // this will convert the JSON string to JSON object


        // let query = Tour.find(JSON.parse(queryStr));

        return this; // this will return the entire object
    }

    sort() {
        // 3. SORTING
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(",").join(" "); // this will first split the string by comma and then join the string by space
            console.log(sortBy);
            this.query = this.query.sort(sortBy); // this will sort the tours according to the query.sort
            // for example if we want to sort the tours according to the price then we will pass this query string in the url : [ http://localhost:3000/api/v2/tours?sort=price ] and this will sort the tours according to the price in ascending order.
            // and if we want to sort the tours according to the price in descending order then we will pass this query string in the url : [ http://localhost:3000/api/v2/tours?sort=-price ] and this will sort the tours according to the price in descending order.
        } else {
            this.query = this.query.sort("-createdAt"); // this will sort the tours according to the createdAt in descending order.
        }

        return this; // this will return the entire object
    }

    limitFields() {
        // 4. FIELD LIMITING
        // : field limiting means that we can limit the fields which we want to show in the response. the advantage of this is that the bandwidth will be saved and the response will be faster. and we can do this by passing the query string in the url like this : [ http://localhost:3000/api/v2/tours?fields=name,price,duration,difficulty ] and this will only show the name, price, duration, difficulty fields in the response.

        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(",").join(" ");
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select("-__v"); // this will exclude the __v field from the response
        }

        return this; // this will return the entire object
    }

    paginate() {
        // 5. PAGINATION
        // : pagination means that we can limit the number of documents which we want to show in the response. and we can do this by passing the query string in the url like this : [ http://localhost:3000/api/v2/tours?page=2&limit=10 ] and this will show the 10 documents in the response which are on the 2nd page.
        const page = this.queryString.page * 1 || 1; // this will convert the string to number and if the page query string is not present then it will set the page to 1
        const limit = this.queryString * 1 || 100; // this will convert the string to number and if the limit query string is not present then it will set the limit to 100
        const skip = (page - 1) * limit;  // this will calculate the number of documents which we have to skip i.e. if the page is 2 and limit is 10 then we have to skip 10 documents which are on the 1st page.
        this.query = this.query.skip(skip).limit(limit);


        return this; // this will return the entire object
    }

}


module.exports = APIFeatures;