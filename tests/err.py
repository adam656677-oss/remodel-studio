from h import *
with app(1400,900,mode='design') as (pg,errs):
    pg.wait_for_timeout(1500); print(errs[:5])
