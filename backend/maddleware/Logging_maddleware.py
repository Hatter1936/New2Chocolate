import time
import logging
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger('django.request')

class RequestLoggingMiddleware(MiddlewareMixin):
    """
    Логирование всех запросов к API
    """
    def process_request(self, request):
        request.start_time = time.time()
        
    def process_response(self, request, response):
        if hasattr(request, 'start_time'):
            duration = time.time() - request.start_time
            logger.info(
                f'Method: {request.method}, Path: {request.path}, '
                f'Status: {response.status_code}, Duration: {duration:.2f}s'
            )
        return response