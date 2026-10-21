import json
import boto3
from boto3.dynamodb.conditions import Attr

table = boto3.resource("dynamodb").Table("smilewithj-slots")

def lambda_handler(event, context):
    result = table.scan(FilterExpression=Attr("status").eq("open"))
    slots = sorted(item["slotId"] for item in result.get("Items", []))
    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "https://smilewithj.com"
        },
        "body": json.dumps({"openSlots": slots})
    }