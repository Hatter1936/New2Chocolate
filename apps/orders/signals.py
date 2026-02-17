from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import OrderItem

@receiver(post_save, sender=OrderItem)
def update_product_orders_count(sender, instance, created, **kwargs):
    """
    При создании заказа обновляем счетчик заказов товара
    """
    if created:
        product = instance.product
        product.orders_count += instance.quantity
        product.save(update_fields=['orders_count'])