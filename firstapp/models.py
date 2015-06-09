from django.db import models
from django.utils import timezone

# Create your models here.

class Blog(models.Model):
	content = models.TextField()
	writer = models.CharField(max_length = 50)
	write_date = models.DateTimeField('date published')

class BlogComment(models.Model):
	blog = models.ForeignKey(Blog)
	content = models.TextField()
	writer = models.CharField(max_length = 50)
	write_date = models.DateTimeField('date published')