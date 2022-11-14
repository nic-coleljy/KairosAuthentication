import pymongo
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view

@csrf_exempt
@api_view(['GET', 'POST', 'DELETE', 'PUT'])
def user_crud(request):
    myclient = pymongo.MongoClient("")
    mydb = myclient["cluster0"]
    mycol = mydb["registration_list"]

    if request.method == 'POST':
            json_data = json.loads(str(request.body, encoding='utf-8'))
            insert_result = mycol.insert_one(json_data)
            if insert_result.inserted_id != None:
                return JsonResponse({"success": "User Created Successfully!"})
            else:
                return JsonResponse({"error": "Failed to Create User"})
    elif request.method == 'GET':
        if request.GET.get('user_id') is not None:
            user = mycol.find_one({"id": request.GET.get('user_id')})
            if user is None:
                return JsonResponse({"error": "Failed to Get User"})
            else:
                del user["_id"]
                return JsonResponse(user)
        else:
            json_dict = dict()
            count = 0
            for x in mycol.find({}):
                del x["_id"]
                json_dict[str(count)] = x
                count += 1
            return JsonResponse(json_dict)
    elif request.method == 'PUT':
        json_data = json.loads(str(request.body, encoding='utf-8'))
        put_result = mycol.replace_one({"email" : json_data["email"]}, json_data)
        if put_result.modified_count == 1:
            return JsonResponse({"success": "User Updated Successfully!"})
        else:
            return JsonResponse({"error": "Failed to Update User"})
    elif request.method == 'DELETE':
        if request.GET.get('user_id') is not None:
            delete_result = mycol.delete_one({"id": request.GET.get('user_id')})
            if delete_result.deleted_count == 1:
                return JsonResponse({"success": "User Deleted Successfully!"})
            else:
                return JsonResponse({"error": "Failed to Delete User"})
        else:
            return JsonResponse({"error": "Missing User ID Parameters!"})
            
    else:
        return JsonResponse({"error": "Incorrect HTTP Method"})