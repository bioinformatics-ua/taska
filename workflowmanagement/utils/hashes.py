from hashids import Hashids

def createHash(identificator):
    '''Generator of public hash keys

    This method automatically generate unique public hashes to be used when referencing objects inside the system.
    This is done to introduce identificator obfuscation and to stop URL snooping attempts.

    Args:
        :identificator (int): identificator number to ofuscate (usually the model id)
    '''
    hashids = Hashids(salt="esh2YTBZesh2YTBZ", min_length=5)

    return hashids.encrypt(identificator)
