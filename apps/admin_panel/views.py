from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import JsonResponse
from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView
from apps.catalog.models import Product, Category
from .serializers import AdminProductSerializer
from django.contrib.auth.mixins import UserPassesTestMixin

class IsAdminUser(permissions.BasePermission):
    """
    Разрешение только для админов
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_staff

class ProductViewSet(viewsets.ModelViewSet):
    """
    API для управления товарами
    """
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = AdminProductSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        return Product.objects.all().select_related('category').order_by('-created_at')

class DashboardView(APIView):
    """
    Статистика для админки
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        total_products = Product.objects.count()
        total_categories = Category.objects.count()
        
        return JsonResponse({
            'stats': {
                'products': total_products,
                'categories': total_categories
            }
        })

@method_decorator(staff_member_required, name='dispatch')
class AdminPanelView(TemplateView):
    """
    HTML страница админки
    """
    template_name = 'admin_panel/index.html'
    
    def test_func(self):
        return self.request.user.is_staff
    
    def handle_no_permission(self):
        return redirect('/')