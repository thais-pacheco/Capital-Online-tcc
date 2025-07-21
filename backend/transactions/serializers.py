from rest_framework import serializers

class TransactionSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    type = serializers.CharField(max_length=10)
    description = serializers.CharField(max_length=255)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    category = serializers.CharField(max_length=100)
    document = serializers.CharField(max_length=100, required=False, allow_null=True)
    date = serializers.DateField()
    notes = serializers.CharField(required=False, allow_null=True, allow_blank=True)