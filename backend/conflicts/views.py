from rest_framework import viewsets, filters
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Sum, Count, Q
from .models import Conflict
from .serializers import ConflictListSerializer, ConflictDetailSerializer


class ConflictViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Conflict.objects.all()
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'country', 'region']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ConflictDetailSerializer
        return ConflictListSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        params = self.request.query_params

        severity = params.get('severity')
        if severity:
            qs = qs.filter(severity=severity)

        status = params.get('status')
        if status:
            qs = qs.filter(status=status)

        cause = params.get('cause')
        if cause:
            qs = qs.filter(cause=cause)

        min_parties = params.get('min_parties')
        if min_parties:
            qs = qs.filter(parties__length__gte=int(min_parties))

        start_after = params.get('start_after')
        if start_after:
            qs = qs.filter(start_date__gte=start_after)

        start_before = params.get('start_before')
        if start_before:
            qs = qs.filter(start_date__lte=start_before)

        year = params.get('year')
        if year:
            qs = qs.filter(start_date__year__lte=int(year)).filter(
                Q(end_date__year__gte=int(year)) | Q(end_date__isnull=True)
            )

        return qs


@api_view(['GET'])
def stats_view(request):
    qs = Conflict.objects.all()

    severity = request.query_params.get('severity')
    if severity:
        qs = qs.filter(severity=severity)
    status = request.query_params.get('status')
    if status:
        qs = qs.filter(status=status)

    return Response({
        'total': qs.count(),
        'by_severity': dict(qs.values_list('severity').annotate(c=Count('id')).values_list('severity', 'c')),
        'by_status': dict(qs.values_list('status').annotate(c=Count('id')).values_list('status', 'c')),
        'by_cause': dict(qs.values_list('cause').annotate(c=Count('id')).values_list('cause', 'c')),
        'total_casualties': qs.aggregate(s=Sum('casualties_estimated'))['s'] or 0,
        'total_refugees': qs.aggregate(s=Sum('refugees_count'))['s'] or 0,
    })


@api_view(['GET'])
def geojson_view(request):
    qs = Conflict.objects.all()

    severity = request.query_params.get('severity')
    if severity:
        qs = qs.filter(severity=severity)
    status = request.query_params.get('status')
    if status:
        qs = qs.filter(status=status)
    cause = request.query_params.get('cause')
    if cause:
        qs = qs.filter(cause=cause)

    year = request.query_params.get('year')
    if year:
        qs = qs.filter(start_date__year__lte=int(year)).filter(
            Q(end_date__year__gte=int(year)) | Q(end_date__isnull=True)
        )

    features = []
    for c in qs:
        features.append({
            'type': 'Feature',
            'geometry': {'type': 'Point', 'coordinates': [c.lon, c.lat]},
            'properties': {
                'slug': c.slug,
                'title': c.title,
                'severity': c.severity,
                'status': c.status,
                'cause': c.cause,
                'start_date': str(c.start_date),
                'end_date': str(c.end_date) if c.end_date else None,
                'casualties_estimated': c.casualties_estimated,
                'refugees_count': c.refugees_count,
                'parties_count': len(c.parties) if c.parties else 0,
                'country': c.country,
                'region': c.region,
            }
        })

    return Response({'type': 'FeatureCollection', 'features': features})
