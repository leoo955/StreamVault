import asyncio
import websockets

# Stockage des messages en mémoire vive (RAM)
history = []

async def handler(websocket):
    # Envoie l'historique complet au nouveau client dès sa connexion
    for msg in history:
        await websocket.send(f"Historique: {msg}")
        
    try:
        async for message in websocket:
            # Sauvegarde du message dans la liste
            history.append(message)
            
            # Récupère tous les clients actuellement connectés
            connected = list(websocket.ws_server.websockets)
            
            # Diffusion (Broadcast) du message à tout le monde en simultané
            if connected:
                await asyncio.gather(*[client.send(message) for client in connected])
                
    except websockets.exceptions.ConnectionClosed:
        # Gère proprement la déconnexion d'un client
        pass

async def main():
    # Démarre le serveur sur localhost (port 8765)
    async with websockets.serve(handler, "localhost", 8765):
        print("Serveur WebSocket actif sur ws://localhost:8765")
        await asyncio.Future() # Maintient le serveur en vie

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nServeur arrêté.")