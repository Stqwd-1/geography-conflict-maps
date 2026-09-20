import csv
import json
from django.core.management.base import BaseCommand
from conflicts.models import Conflict


class Command(BaseCommand):
    help = 'Import conflicts from CSV or JSON file'

    def add_arguments(self, parser):
        parser.add_argument('file', type=str)
        parser.add_argument('--format', choices=['csv', 'json'], default='csv')

    def handle(self, *args, **options):
        filepath = options['file']
        if options['format'] == 'csv':
            self.import_csv(filepath)
        else:
            self.import_json(filepath)

    def import_csv(self, filepath):
        count = 0
        with open(filepath, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                obj, created = Conflict.objects.update_or_create(
                    slug=row['slug'],
                    defaults={
                        'title': row['title'],
                        'lat': float(row['lat']),
                        'lon': float(row['lon']),
                        'region': row.get('region', ''),
                        'country': row.get('country', ''),
                        'severity': row.get('severity', 'local'),
                        'status': row.get('status', 'active'),
                        'cause': row.get('cause', 'territorial'),
                        'start_date': row['start_date'],
                        'end_date': row.get('end_date') or None,
                        'casualties_estimated': int(row['casualties']) if row.get('casualties') else None,
                        'refugees_count': int(row['refugees']) if row.get('refugees') else None,
                        'summary': row.get('summary', ''),
                        'description': row.get('description', ''),
                        'parties': json.loads(row.get('parties', '[]')),
                        'sources': json.loads(row.get('sources', '[]')),
                    }
                )
                count += 1
                action = 'Created' if created else 'Updated'
                self.stdout.write(f'  {action}: {row["title"]}')
        self.stdout.write(self.style.SUCCESS(f'Imported {count} conflicts from {filepath}'))

    def import_json(self, filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        count = 0
        for item in data:
            obj, created = Conflict.objects.update_or_create(
                slug=item['slug'],
                defaults={
                    'title': item['title'],
                    'lat': float(item['lat']),
                    'lon': float(item['lon']),
                    'region': item.get('region', ''),
                    'country': item.get('country', ''),
                    'severity': item.get('severity', 'local'),
                    'status': item.get('status', 'active'),
                    'cause': item.get('cause', 'territorial'),
                    'start_date': item['start_date'],
                    'end_date': item.get('end_date'),
                    'casualties_estimated': item.get('casualties_estimated'),
                    'refugees_count': item.get('refugees_count'),
                    'summary': item.get('summary', ''),
                    'description': item.get('description', ''),
                    'parties': item.get('parties', []),
                    'sources': item.get('sources', []),
                }
            )
            count += 1
        self.stdout.write(self.style.SUCCESS(f'Imported {count} conflicts from {filepath}'))
