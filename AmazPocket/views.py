from sqlite3 import IntegrityError

from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from AmazPocket.models import User


# Create your views here.
def index(request):
    return render(request, "AmazPocket/index.html")


def login_view(request):
    if request.method == 'POST':

        # Attempt to sign user in
        email = request.POST["email"]
        password = request.POST["password"]
        user = authenticate(request, username=email, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "AmazPocket/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "AmazPocket/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "AmazPocket/register.html",
                          {"message": "Passwords must match."})

        firstname = request.POST["firstname"]
        lastname = request.POST["lastname"]
        email = request.POST["email"]
        vendor_name = None
        is_vendor = False
        if "vendor" in request.POST:
            is_vendor = True
            vendor_name = request.POST["vendor_name"]

        try:
            user = User.objects.create_user(first_name=firstname, last_name=lastname,
                                            email=email, username=email, password=password,
                                            is_vendor=is_vendor, vendor_name=vendor_name)
        except IntegrityError:
            return render(request, "AmazPocket/register.html",
                          {"message": "Username already taken."})

        login(request, user)
        # TODO redirect to vendor page if it is a vendor.
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "AmazPocket/register.html")


def profile(request):
    if request.method == "GET":
        user = User.objects.get(pk=request.user.id)

        return render(request, "AmazPocket/profile.html", {
            "profile": user.serialize()
        })


# def add_item(request):
#     if request.method == "POST":
