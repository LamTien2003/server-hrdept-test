class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = { ...queryString };
    }

    filter() {
        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'sort', 'pageSize', 'fields', 'searchText'];
        excludedFields.forEach((el) => delete queryObj[el]);

        // 1B) Advanced filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));

        return this;
    }
    search(fieldsName, queryName) {
        const q = this.queryString[queryName];
        const queryConditions = fieldsName?.reduce((prev, current) => {
            return [...prev, { [current]: { $regex: q, $options: 'i' } }];
        }, []);

        if (q) {
            this.query = this.query.find({
                $or: queryConditions,
            });
            delete this.queryString[queryName];
        }
        return this;
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }

        return this;
    }

    limit() {
        if (this.queryString.pageSize) {
            const limit = this.queryString.pageSize * 1 || 10;
            this.query = this.query.limit(limit);
        } else {
            this.query = this.query.select('-__v');
        }

        return this;
    }
    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }

        return this;
    }

    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.pageSize * 1 || 100;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}
module.exports = APIFeatures;
