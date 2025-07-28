# core/registry/handler_registry.py
from importlib import import_module
from config import settings
from core.file_handlers.base_handler import FileHandler

class HandlerRegistry:
    _handlers = {}

    @classmethod
    def load_handlers(cls):
        """Load all handlers defined in settings"""
        if not cls._handlers:
            for ext, handler_path in settings.HANDLER_REGISTRY.items():
                module_path, class_name = handler_path.rsplit('.', 1)
                try:
                    module = import_module(module_path)
                    handler_class = getattr(module, class_name)
                    cls._handlers[ext] = handler_class
                except (ImportError, AttributeError) as e:
                    print(f"Error loading handler {handler_path}: {e}")
                    continue

    @classmethod
    def get_handler(cls, extension: str) -> FileHandler:
        """Get handler instance for file extension"""
        cls.load_handlers()
        handler_class = cls._handlers.get(extension.lower())

        if not handler_class:
            # Fallback to default handler
            from core.file_handlers.default_handler import DefaultHandler
            return DefaultHandler()

        return handler_class()