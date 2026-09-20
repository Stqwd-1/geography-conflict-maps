from django.db import models


class Conflict(models.Model):
    SEVERITY_CHOICES = [
        ('global', 'Глобальный'),
        ('regional', 'Региональный'),
        ('local', 'Локальный'),
    ]
    STATUS_CHOICES = [
        ('active', 'Активный'),
        ('frozen', 'Замороженный'),
        ('resolved', 'Завершённый'),
    ]
    CAUSE_CHOICES = [
        ('territorial', 'Территориальный'),
        ('ethnic', 'Этнический'),
        ('economic', 'Экономический'),
        ('political', 'Политический'),
        ('religious', 'Религиозный'),
    ]

    slug = models.SlugField(unique=True, max_length=200)
    title = models.CharField(max_length=500)
    lat = models.FloatField()
    lon = models.FloatField()
    region = models.CharField(max_length=200)
    country = models.CharField(max_length=200)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    cause = models.CharField(max_length=20, choices=CAUSE_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    casualties_estimated = models.IntegerField(null=True, blank=True)
    refugees_count = models.IntegerField(null=True, blank=True)
    summary = models.TextField(max_length=500)
    description = models.TextField(blank=True)
    parties = models.JSONField(default=list)
    sources = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return self.title
