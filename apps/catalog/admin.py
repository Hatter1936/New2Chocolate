from django.contrib import admin
from django.utils.html import format_html
from .models import Category, Tag, Product, ProductImage

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'parent', 'order', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ['order', 'is_active']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('parent')


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'color', 'is_active']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ['image', 'order']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'old_price', 'in_stock', 'views_count', 'is_active']
    list_filter = ['category', 'tags', 'in_stock', 'is_active']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ['price', 'in_stock', 'is_active']
    readonly_fields = ['views_count', 'orders_count', 'created_at', 'updated_at']
    inlines = [ProductImageInline]
    fieldsets = (
        ('Основная информация', {
            'fields': ('name', 'slug', 'category', 'tags', 'description', 'short_description')
        }),
        ('Цены и наличие', {
            'fields': ('price', 'old_price', 'in_stock', 'quantity', 'weight')
        }),
        ('Изображения', {
            'fields': ('main_image',)
        }),
        ('Статистика', {
            'fields': ('views_count', 'orders_count'),
            'classes': ('collapse',)
        }),
        ('SEO', {
            'fields': ('meta_title', 'meta_description'),
            'classes': ('collapse',)
        }),
        ('Системное', {
            'fields': ('is_active', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def image_preview(self, obj):
        if obj.main_image:
            return format_html('<img src="{}" style="max-height: 50px;"/>', obj.main_image.url)
        return "-"
    image_preview.short_description = 'Превью'