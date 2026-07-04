# forms.py
from django import forms
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from .models import Customer
import re
from django.contrib.auth.forms import UserCreationForm


class CustomerProfileForm(forms.ModelForm):
    """Form for editing customer profile"""
    
    class Meta:
        model = Customer
        fields = ['username']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 focus:outline-none transition-all duration-300',
                'placeholder': 'Your full name'
            }),
            'address': forms.Textarea(attrs={
                'class': 'w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 focus:outline-none transition-all duration-300',
                'rows': 3,
                'placeholder': 'Your delivery address'
            }),
            'phone_number': forms.TextInput(attrs={
                'class': 'w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 focus:outline-none transition-all duration-300',
                'placeholder': 'Your phone number'
            }),
        }


class CustomerRegistrationForm(UserCreationForm):
    
    class Meta:
        model = User
        fields = ['username']
