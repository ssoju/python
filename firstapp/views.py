import os
import json
import logging
import datetime
from django.shortcuts import render
from django.core import serializers
from django.http import HttpResponse
from django.template  import Context, loader
from django.shortcuts import render_to_response, redirect
from django.utils import timezone

from firstapp.models import Blog
from firstapp.models import BlogComment

# Create your views here.
def hello(request):
	return HttpResponse("Hello World")

def indexLayout(request):
	template = loader.get_template('index.html')
	return HttpResponse(template.render())

def blogs(request):
	entries = Blog.objects.all()

	return HttpResponse(serializers.serialize('json', entries), content_type='application/json')

def blog(request, id=None):
	if request.method == 'POST':
		b = Blog(writer = request.POST['writer'], content = request.POST['content'], write_date = timezone.now())
		b.save()
		return redirect('/')
	elif request.method == 'PUT':
		b = Blog(blog = request.PUT['blog_id'], writer = request.PUT['writer'], content = request.PUT['content'], write_date = timezone.now())
		b.save()
		return redirect('/blog/' + request.PUT['blog_id'])
	elif request.method == 'DELETE':
		Blog.objects.filter(blod = request.DELETE['blog_id']).delete()
		return redirect('/')
	else:		
		entries = [Blog.objects.get(id = id), ]
		return HttpResponse(serializers.serialize('json', entries), content_type='application/json')


def blogPost(request):
	blog = Blog(request.POST['writer'], request.POST['content'])
	try:
		blog.save()
	except (KeyError):
		return HttpResponse("{\"error\":500}", content_type='application/json')

def comments(request):
	if request.method == 'POST':
		blogId = request.POST['blog_id']
		comment = BlogComment(blog_id=request.POST['blog_id'], writer=request.POST['writer'], content=request.POST['content'], write_date=timezone.now())
		comment.save()
	else:
		blogId = request.GET['blog_id']

	comments = BlogComment.objects.filter(blog=blogId)
	
	return HttpResponse(serializers.serialize('json', comments), content_type='application/json')

