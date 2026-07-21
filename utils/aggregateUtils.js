



function sumPipeline(userId, field) {
    return [
        {
            $match: {
                user: userId
            }
        },
        {
            $group: {
                _id: null,
                total: {
                    $sum: `$${field}`
                }
            }
        }
    ];
}

module.exports = {
    sumPipeline
};