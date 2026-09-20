from rest_framework import serializers
from .models import Conflict


class ConflictListSerializer(serializers.ModelSerializer):
    parties_count = serializers.SerializerMethodField()

    class Meta:
        model = Conflict
        fields = [
            'slug', 'title', 'lat', 'lon', 'region', 'country',
            'severity', 'status', 'cause', 'start_date', 'end_date',
            'casualties_estimated', 'refugees_count', 'summary',
            'parties_count',
        ]

    def get_parties_count(self, obj):
        return len(obj.parties) if obj.parties else 0


class ConflictDetailSerializer(serializers.ModelSerializer):
    parties_count = serializers.SerializerMethodField()

    class Meta:
        model = Conflict
        fields = '__all__'

    def get_parties_count(self, obj):
        return len(obj.parties) if obj.parties else 0
