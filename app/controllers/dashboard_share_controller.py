
import json
import logging
from response import Response
from flask import request
import requests

def dashboard_share():
    try:
        email = request.cookies.get('userId')
        logging.info("User {} Action SHARE_DASHBOARD".format(email))
        return Response(200, "Success").to_dict(), 200
    except Exception as err:
        logging.error(err)
        return Response(500, "Internal Server Error").to_dict(), 500

def dashboard_share_linkedin():
    try:
        print('asdasdsda')
        params = request.form.to_dict()
        shareImageFile = request.files['file']
        print(params)
        print(shareImageFile)
        authCode = params.get('code')
        shareText = params.get('shareText')

        # get access_token from code
        url = "https://www.linkedin.com/oauth/v2/accessToken?grant_type=authorization_code&code=" + authCode + "&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fdashboard&client_id=77s04eexgpvevc&client_secret=BZa81scPddNc7YNk"
        payload={}
        response = requests.request("POST", url, data=payload)
        print('access_token', response.text)
        accessToken = json.loads(response.text).get('access_token')
        # accessToken = 'AQU8T9KfPkbLa1aEccgQ0yKWtzoHM_F4BuX8_uvtpH_YbQWyXBAZGOgcVDJ1lgkpMfoXBbknwS4xstzazJxTwTfYYixtbFLhRS00iNv7TLOWF_ndUUvodY-lXX6jE4g0NNbh3WJ61HjfM86_iNbxWUVGb_aX5iOJ4yik3FNkaIYpZ9YWaduMviY5PZxXqsWALDLV9ziXhRPqgb0g3hLbomw2L3CIt325CFqBTfgKhljppYTwx5YfVOzzbFZIaFCfO1Y8VbYY8B4f8mpC0hPqu_GjUWUkQ8fSmAXKPKGnQJ9WInrM7eK2U7BQc-tB8Q3f2UwSiB5JhQowaWo8g7RRFl1tjUB-hA'

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
