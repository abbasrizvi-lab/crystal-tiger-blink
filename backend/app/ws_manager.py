from typing import Set
from fastapi import WebSocket

connected_clients: Set[WebSocket] = set()