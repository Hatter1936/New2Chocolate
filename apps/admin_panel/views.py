from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser

class DashboardView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        return JsonResponse({'message': 'Admin dashboard'})