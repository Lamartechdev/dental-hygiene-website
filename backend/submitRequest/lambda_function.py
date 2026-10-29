import json
import uuid
from datetime import datetime, timezone
import boto3
from botocore.exceptions import ClientError

table = boto3.resource("dynamodb").Table("smilewithj-request")
ses = boto3.client("ses")

ALERT_TO = "Jayanbulan0691@gmail.com"
ALERT_FROM = "Smile with Jay <alerts@smilewithjay.com>"

HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "https://smilewithjay.com"
}

def reply(code, body):
    return {"statusCode": code, "headers": HEADERS, "body": json.dumps(body)}

def send_alert(name, email, phone, preferred):
    lines = [
        "New appointment request on smilewithjay.com!",
        "",
        f"Name:  {name}",
        f"Email: {email or 'not given'}",
        f"Phone: {phone or 'not given'}",
        "",
        "Preferred day/time and message:",
        preferred,
    ]
    message = {
        "Source": ALERT_FROM,
        "Destination": {"ToAddresses": [ALERT_TO]},
        "Message": {
            "Subject": {"Data": f"New request: {name}"},
            "Body": {"Text": {"Data": "\n".join(lines)}}
        }
    }
    if email:
        message["ReplyToAddresses"] = [email]
    try:
        ses.send_email(**message)
    except ClientError as err:
        print("Email alert failed:", err)

def lambda_handler(event, context):
    try:
        data = json.loads(event.get("body") or "{}")
    except json.JSONDecodeError:
        return reply(400, {"error": "Invalid request."})

    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    phone = data.get("phone", "").strip()
    preferred = data.get("preferredTime", "").strip()

    if not (name and (email or phone) and preferred):
        return reply(400, {"error": "Please include your name, an email or phone number, and your preferred date and time."})

    request_id = str(uuid.uuid4())
    table.put_item(Item={
        "requestId": request_id,
        "status": "pending",
        "patientName": name,
        "email": email,
        "phone": phone,
        "preferredTime": preferred,
        "createdAt": datetime.now(timezone.utc).isoformat()
    })

    send_alert(name, email, phone, preferred)
    return reply(200, {"message": "Request received! Jay-An will contact you to confirm.", "requestId": request_id})