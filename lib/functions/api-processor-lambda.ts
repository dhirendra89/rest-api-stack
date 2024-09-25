exports.handler = async function(event: any, context: any){
    return {
        statusCode: 200,
        body: JSON.stringify('Hellow World from Rest API Stack!')
    };
};