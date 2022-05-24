
import json
import logging
from app.archive_constants import LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, LINKEDIN_REDIRECT_URI_DASH_ABUSE, LINKEDIN_REDIRECT_URI_DASH_CYCLE
from app.response import Response
from flask import request
import requests
import urllib.parse

def dashboard_audit():
    try:
        email = request.cookies.get('userId')
        print('request.data', request.args.to_dict())
        args = request.args.to_dict()
        logTxt = 'User {} Action ' + args.get('action').upper()
        logging.info(logTxt.format(email))
        return Response(200, "Success").to_dict(), 200
    except Exception as err:
        logging.error(err)
        return Response(500, "Internal Server Error").to_dict(), 500

def dashboard_share_linkedin():
    try:
        params = request.form.to_dict()
        shareImageFile = request.files['file']
        authCode = params.get('code')
        shareText = params.get('shareText')
        dashboard = params.get("dashboard")
        redirectUri = ''
        if dashboard == 'cycle':
            redirectUri = urllib.parse.quote(LINKEDIN_REDIRECT_URI_DASH_CYCLE, safe='')
        if dashboard == 'abuse':
            redirectUri = urllib.parse.quote(LINKEDIN_REDIRECT_URI_DASH_ABUSE, safe='')

        # get access_token from code
        url = "https://www.linkedin.com/oauth/v2/accessToken?grant_type=authorization_code&code=" + authCode + "&redirect_uri=" + redirectUri + "&client_id=" + LINKEDIN_CLIENT_ID + "&client_secret=" + LINKEDIN_CLIENT_SECRET
        payload={}
        response = requests.request("POST", url, data=payload)
        accessToken = json.loads(response.text).get('access_token') 
        # get user id from access_token
        url = "https://api.linkedin.com/v2/me"
        payload={}
        headers = {
            'Authorization': 'Bearer ' + accessToken
        }
        response = requests.request("GET", url, headers=headers, data=payload)
        print('user', response.text)
        json_data = json.loads(response.text)
        print('user', json_data.get('id'))
        userId = json_data.get('id')  # UoZAlTMGds

        # image register
        url = "https://api.linkedin.com/v2/assets?action=registerUpload"
        payload = json.dumps({
            "registerUploadRequest": {
                "recipes": [
                    "urn:li:digitalmediaRecipe:feedshare-image"
                ],
                "owner": "urn:li:person:" + userId,
                "serviceRelationships": [
                    {
                        "relationshipType": "OWNER",
                        "identifier": "urn:li:userGeneratedContent"
                    }
                ]
            }
        })
        headers = {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json',
        }
        response = requests.request("POST", url, headers=headers, data=payload)
        print(response.text)
        json_data = json.loads(response.text)
        uploadUrl = json_data.get('value').get('uploadMechanism').get('com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest').get('uploadUrl')
        assetLink = json_data.get('value').get('asset')
        print('uploadUrl', uploadUrl)
        print('assetLink', assetLink)

        # upload image binary
        url = uploadUrl
        payload=shareImageFile.read()
        # files=[shareImageFile]
        # files={
        #    'file': open('C:\\Users\\Administrator\\Desktop\\ampcloud server\\app\\controllers\\Cycle Index Data - Energy and Capacity Decay (3).png','rb')
        # }
        headers = {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'image/png'
        }
        response = requests.request("POST", url, headers=headers, data=payload)
        print('img upld', response.text)

        # make post
        url = "https://api.linkedin.com/v2/ugcPosts"
        payload = json.dumps({
            "author": "urn:li:person:" + userId,
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {
                    "text": shareText
                },
                "shareMediaCategory": "IMAGE",
                "media": [
                    {
                    "status": "READY",
                    "description": {
                        "text": "Amplabs Dashboard"
                    },
                    "media": assetLink,
                    "title": {
                        "text": "Amplabs Dashboard"
                    }
                    }
                ]
                }
            },
            "visibility": {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
            }
        })
        headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken,

        }

        response = requests.request("POST", url, headers=headers, data=payload)

        print('img shared! ', response.text)

        return Response(200, "Success", json.loads(response.text)).to_dict(), 200
    except Exception as err:
        logging.error(err)
        return Response(500, "Internal Server Error").to_dict(), 500
