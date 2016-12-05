from rest_framework import filters

def create_serializer(viewset, request):
    '''Utility method, useful whenever i need to retrieve the serializer after a standard ViewSet create application to
    other purposes, like history logging
    '''
    serializer = viewset.get_serializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    viewset.perform_create(serializer)
    headers = viewset.get_success_headers(serializer.data)

    return (serializer, headers)

class AliasOrderingFilter(filters.OrderingFilter):
    ordering_map = {}
    def filter_queryset(self, request, queryset, view):
        ordering = self.get_ordering(request, queryset, view)

        if ordering:
            # Skip any incorrect parameters
            ordering = self.remove_invalid_fields(queryset, ordering, view)

        if not ordering:
            # Use 'ordering' attribute by default
            ordering = self.get_default_ordering(view)

        if ordering:
            ordering_map = getattr(view, 'ordering_map', self.ordering_map)
            for index in xrange(len(ordering)):
                clean = ordering[index].replace('-','')
                signal = ''
                if '-' in ordering[index]:
                    signal = '-'

                try:
                    ordering[index] = signal + ordering_map[clean]
                except KeyError:
                    pass
            return queryset.order_by(*ordering)

        return queryset
