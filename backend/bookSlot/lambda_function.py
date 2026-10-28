import json
import boto3
from botocore.exceptions import ClientError

table = boto3.resource("dynamodb").Table("smilewithj-slots")

HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "https://smilewithjay.com"
}

def reply(code, body):
    return {"statusCode": code, "headers": HEADERS, "body": json.dumps(body)}

def lambda_handler(event, context):
    try:
        data = json.loads(event.get("body") or "{}")
    except json.JSONDecodeError:
        return reply(400, {"error": "Invalid request."})

    slot_id = data.get("slotId", "").strip()
    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    phone = data.get("phone", "").strip()

    if not (slot_id and name and (email or phone)):
        return reply(400, {"error": "Please include a time slot, your name, and an email or phone number."})

    try:
        table.update_item(
            Key={"slotId": slot_id},
            UpdateExpression="SET #s = :booked, patientName = :n, email = :e, phone = :p",
            ConditionExpression="#s = :open",
            ExpressionAttributeNames={"#s": "status"},
            ExpressionAttributeValues={
                ":booked": "booked",
                ":open": "open",
                ":n": name,
                ":e": email,
                ":p": phone
            }
        )
    except ClientError as err:
        if err.response["Error"]["Code"] == "ConditionalCheckFailedException":
            return reply(409, {"error": "Sorry, that time was just taken. Please pick another."})
        raise

    return reply(200, {"message": "You're booked!", "slotId": slot_id})