import requests

def trigger_reflection_generation():
    url = "http://localhost:8001/api/v1/tasks/generate-reflections"
    try:
        response = requests.post(url)
        response.raise_for_status()  # Raise an exception for bad status codes
        print("Successfully triggered reflection generation.")
        print("Response:", response.json())
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    trigger_reflection_generation()