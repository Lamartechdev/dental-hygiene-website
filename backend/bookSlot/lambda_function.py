import json
import boto3
from datetime import datetime
from botocore.exceptions import ClientError

table = boto3.resource("dynamodb").Table("smilewithj-slots")
ses = boto3.client("ses")

ALERT_TO = "Jayanbulan0691@gmail.com"
ALERT_FROM = "Smile with Jay <alerts@smilewithjay.com>"

HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "https://smilewithjay.com"
}

def reply(code, body):
    return {"statusCode": code, "headers": HEADERS, "body": json.dumps(body)}

def pretty_time(slot_id):
    # "2026-11-12T10:00" -> "Thursday, Nov 12 at 10:00 AM"
    return datetime.strptime(slot_id, "%Y-%m-%dT%H:%M").strftime("%A, %b %d at %I:%M %p")

def send_alert(slot_id, name, email, phone):
    lines = [
        "New booking on smilewithjay.com!",
        "",
        f"When:  {pretty_time(slot_id)}",
        f"Name:  {name}",
        f"Email: {email or 'not given'}",
        f"Phone: {phone or 'not given'}",
    ]
    message = {
        "Source": ALERT_FROM,
        "Destination": {"ToAddresses": [ALERT_TO]},
        "Message": {
            "Subject": {"Data": f"New booking: {name}, {pretty_time(slot_id)}"},
            "Body": {"Text": {"Data": "\n".join(lines)}}
        }
    }
    if email:
        message["ReplyToAddresses"] = [email]
    try:
        ses.send_email(**message)
    except ClientError as err:
        # The booking still counts even if the email fails. The error shows up in CloudWatch logs.
        print("Email alert failed:", err)

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

    send_alert(slot_id, name, email, phone)
    return reply(200, {"message": "You're booked!", "slotId": slot_id})