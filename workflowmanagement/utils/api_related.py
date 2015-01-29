def create_serializer(viewset, request):
    '''Utility method, useful whenever i need to retrieve the serializer after a standard ViewSet create application to
    other purposes, like history logging
    '''
    serializer = viewset.get_serializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    viewset.perform_create(serializer)
    headers = viewset.get_success_headers(serializer.data)

    return (serializer, headers)
