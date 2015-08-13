import os,binascii
from flask import Flask, request, session, g, redirect, url_for, abort, \
		render_template, flash, Blueprint, stream_with_context, Response
from werkzeug.utils import secure_filename
from flask import send_from_directory
import datetime, json
from pprint import pprint
from collections import Counter
from time import sleep
import re, datetime
import urllib2, urllib
from twython import Twython

APP_KEY = 'kq4GO2B0wMGIDt8Yek7d5qyrz'
APP_SECRET = 'ntvb2kOHrxEnI27pLVNSSn6tJgdOf5BhYciJSN6BmAJOYerWgm'

app = Flask(__name__)

@app.route('/api/post')
def postOnBehalf():
	username = request.args.get('username')
	oauthtoken = request.args.get('oauth-token')
	oauthtokensecret = request.args.get('oauth-token-secret')
	status = request.args.get('tweet')
	string = username  + '  ' + oauthtoken  + '   ' + oauthtokensecret + ' ' + status
	twitter = Twython(APP_KEY, APP_SECRET, oauthtoken, oauthtokensecret)
	twitter.update_status(status=status)
	print username  + '  ' + oauthtoken  + '   ' + oauthtokensecret + ' ' + status
	return string

@app.route('/')
def screen():
	print 'hello'

if __name__ == '__main__':
	app.debug = True
	app.secret_key=os.urandom(24)
	app.run(host='0.0.0.0', port=9000)