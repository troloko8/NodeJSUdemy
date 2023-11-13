class APIFeatures {
    constructor(query, queryString) {
        this.query = query
        this.queryString = queryString
    }

    filter() {
        // Filtering
        const queryObj = { ...this.queryString }
        const excludedFields = ['page', 'sort', 'limit', 'fields']
        excludedFields.forEach(el => delete queryObj[el])
        // 1) Advanced filtering
        const advancedQueryObj = JSON.parse(JSON.stringify(queryObj).replace(/\b(gte|lte|gt|lt)\b/g, match => `$${match}`))

        this.query = this.query.find(advancedQueryObj)

        return this
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ')
            this.query = this.query.sort(sortBy)// rating average
        } else {
            this.query = this.query.sort('-createdAt')
        }

        return this
    }

    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ')
            this.query = this.query.select(fields)
        } else {
            this.query = this.query.select('-__v')// '-' means excluding
        }

        return this
    }

    paginate() {
        const
            page = this.queryString.page * 1 || 1,
            limit = this.queryString.limit * 1 || 100,
            skip = (page - 1) * limit

        this.query = this.query.skip(skip).limit(limit)

        return this
    }
}

module.exports = APIFeatures